import { useState, useCallback } from 'react';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateTrainingResults } from '../utils/trainingHelpers';
import { calculateNextReview, accuracyToQuality, initializeProgress } from '../utils/spacedRepetition';

/**
 * Custom hook for managing training mode state and operations
 * @param {Object} user - Current authenticated user
 * @param {string} currentGrid - Current grid ID
 * @param {Array} folders - All folders with grids
 * @returns {Object} Training mode state and functions
 */
export const useTrainingMode = (user, currentGrid, folders) => {
  const [trainingMode, setTrainingMode] = useState(false);
  const [trainingGridData, setTrainingGridData] = useState(null);
  const [userAttempt, setUserAttempt] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  /**
   * Start training mode for the current grid
   */
  const startTraining = useCallback(() => {
    // Find the current grid data
    let gridData = null;
    let folderId = null;

    for (const folder of folders) {
      const grid = folder.grids.find(g => g.id === currentGrid);
      if (grid) {
        gridData = grid;
        folderId = folder.id;
        break;
      }
    }

    if (!gridData) {
      console.error('Grid not found');
      return;
    }

    // Initialize training mode
    const now = Date.now();
    setTrainingMode(true);
    setTrainingGridData({ ...gridData, folderId });
    setUserAttempt({});
    setShowResults(false);
    setSessionStats(null);
    setStartTime(now);
    setElapsedTime(0);

    // Start timer
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - now) / 1000));
    }, 1000);

    // Store interval ID for cleanup
    window.trainingTimerInterval = timerInterval;
  }, [currentGrid, folders]);

  /**
   * Submit the user's attempt and calculate results
   */
  const submitAttempt = useCallback(async () => {
    if (!trainingGridData || !user) return;

    // Stop timer
    if (window.trainingTimerInterval) {
      clearInterval(window.trainingTimerInterval);
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);
    const results = calculateTrainingResults(trainingGridData.cellStates || {}, userAttempt);

    // Add metadata to results
    const sessionData = {
      ...results,
      duration,
      gridId: trainingGridData.id,
      gridName: trainingGridData.name,
      folderId: trainingGridData.folderId
    };

    setSessionStats(sessionData);
    setShowResults(true);

    // Save session to Firestore (async, don't wait)
    saveSession(sessionData).catch(err => {
      console.error('Failed to save training session:', err);
    });

    // Update progress (async, don't wait)
    updateProgress(sessionData).catch(err => {
      console.error('Failed to update progress:', err);
    });
  }, [trainingGridData, userAttempt, startTime, user]);

  /**
   * Save training session to Firestore
   */
  const saveSession = async (sessionData) => {
    if (!user) return;

    try {
      await addDoc(collection(db, `users/${user.uid}/training_sessions`), {
        gridId: sessionData.gridId,
        gridName: sessionData.gridName,
        folderId: sessionData.folderId,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: sessionData.duration,
        accuracy: sessionData.accuracy,
        correctCount: sessionData.correctCount,
        missedCount: sessionData.missedCount,
        extraCount: sessionData.extraCount,
        incorrectColorCount: sessionData.incorrectColorCount,
        totalHandsInRange: sessionData.totalHandsInRange,
        correctHands: sessionData.correctHands,
        missedHands: sessionData.missedHands,
        extraHands: sessionData.extraHands,
        incorrectColorHands: sessionData.incorrectColorHands,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error saving training session:', error);
      throw error;
    }
  };

  /**
   * Update training progress for this grid
   */
  const updateProgress = async (sessionData) => {
    if (!user) return;

    try {
      const progressRef = doc(db, `users/${user.uid}/training_progress`, sessionData.gridId);
      const progressSnap = await getDoc(progressRef);

      let progressData;

      if (progressSnap.exists()) {
        // Update existing progress
        progressData = progressSnap.data();

        // Update statistics
        const totalAttempts = (progressData.totalAttempts || 0) + 1;
        const oldTotal = (progressData.averageAccuracy || 0) * (progressData.totalAttempts || 0);
        const newAverage = (oldTotal + sessionData.accuracy) / totalAttempts;

        // Calculate next review using SM-2 algorithm
        const quality = accuracyToQuality(sessionData.accuracy);
        const reviewData = calculateNextReview(
          quality,
          progressData.repetitions || 0,
          progressData.easinessFactor || 2.5,
          progressData.interval || 0
        );

        // Update session history (keep last 20)
        const sessionHistory = progressData.sessionHistory || [];
        sessionHistory.unshift({
          date: new Date().toISOString(),
          accuracy: sessionData.accuracy,
          duration: sessionData.duration
        });
        if (sessionHistory.length > 20) {
          sessionHistory.pop();
        }

        // Update problem hands
        const problemHands = updateProblemHands(
          progressData.problemHands || [],
          sessionData.missedHands,
          sessionData.incorrectColorHands
        );

        progressData = {
          gridId: sessionData.gridId,
          gridName: sessionData.gridName,
          folderId: sessionData.folderId,
          totalAttempts,
          lastAttemptDate: new Date().toISOString(),
          lastAccuracy: sessionData.accuracy,
          averageAccuracy: Math.round(newAverage * 10) / 10,
          bestAccuracy: Math.max(progressData.bestAccuracy || 0, sessionData.accuracy),
          ...reviewData,
          sessionHistory,
          problemHands,
          updatedAt: new Date()
        };
      } else {
        // Create new progress entry
        const quality = accuracyToQuality(sessionData.accuracy);
        const reviewData = calculateNextReview(quality, 0, 2.5, 0);

        const problemHands = updateProblemHands(
          [],
          sessionData.missedHands,
          sessionData.incorrectColorHands
        );

        progressData = {
          gridId: sessionData.gridId,
          gridName: sessionData.gridName,
          folderId: sessionData.folderId,
          totalAttempts: 1,
          lastAttemptDate: new Date().toISOString(),
          lastAccuracy: sessionData.accuracy,
          averageAccuracy: sessionData.accuracy,
          bestAccuracy: sessionData.accuracy,
          ...reviewData,
          sessionHistory: [{
            date: new Date().toISOString(),
            accuracy: sessionData.accuracy,
            duration: sessionData.duration
          }],
          problemHands,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      await setDoc(progressRef, progressData);
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  /**
   * Update problem hands list based on missed/incorrect hands
   */
  const updateProblemHands = (existingProblems, missedHands, incorrectColorHands) => {
    const problems = [...existingProblems];
    const allMistakes = [
      ...missedHands,
      ...incorrectColorHands.map(h => h.hand)
    ];

    allMistakes.forEach(hand => {
      const existing = problems.find(p => p.hand === hand);
      if (existing) {
        existing.missCount++;
        existing.totalSeen++;
      } else {
        problems.push({ hand, missCount: 1, totalSeen: 1 });
      }
    });

    // Also increment totalSeen for hands that were correct this time
    // (we don't track all correct hands, so we'll skip this for simplicity)

    // Sort by miss rate and keep top 10
    problems.sort((a, b) => (b.missCount / b.totalSeen) - (a.missCount / a.totalSeen));
    return problems.slice(0, 10);
  };

  /**
   * Reset the current attempt (clear all painted cells)
   */
  const resetAttempt = useCallback(() => {
    setUserAttempt({});
  }, []);

  /**
   * Try the same grid again
   */
  const tryAgain = useCallback(() => {
    const now = Date.now();
    setUserAttempt({});
    setShowResults(false);
    setSessionStats(null);
    setStartTime(now);
    setElapsedTime(0);

    // Restart timer
    if (window.trainingTimerInterval) {
      clearInterval(window.trainingTimerInterval);
    }
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - now) / 1000));
    }, 1000);
    window.trainingTimerInterval = timerInterval;
  }, []);

  /**
   * Exit training mode and return to normal view
   */
  const exitTraining = useCallback(() => {
    // Clean up timer
    if (window.trainingTimerInterval) {
      clearInterval(window.trainingTimerInterval);
    }

    setTrainingMode(false);
    setTrainingGridData(null);
    setUserAttempt({});
    setShowResults(false);
    setSessionStats(null);
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  return {
    trainingMode,
    trainingGridData,
    userAttempt,
    showResults,
    sessionStats,
    elapsedTime,
    startTraining,
    submitAttempt,
    resetAttempt,
    tryAgain,
    exitTraining,
    setUserAttempt
  };
};
