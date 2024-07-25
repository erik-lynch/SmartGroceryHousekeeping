// adapted from: https://github.com/werfree/progress-bar/blob/eec0233b4c4d7c4120b4f6a41a4c62a386aeca9a/example/src/components/progress-one.tsx
import React, { useEffect, useState } from 'react';

// import './App.css';
import { useProgressBar, LOADING_STATE } from 'react-progress-bar-hook';

function ProgressBarOne() {
  const [interval, setInter] = useState(0);
  const {
    ProgressBarComponent,
    progressBarLoadingState,
    resetProgressBar,
    incrementTotalSteps,
    incrementCompletedSteps,
  } = useProgressBar();

  useEffect(() => {
    incrementTotalSteps(15);
    const inter = setInterval(() => {
      incrementCompletedSteps();
    }, 1000);
    setInter(inter);
    return () => {
      clearInterval(inter);
      setInter(0);
      resetProgressBar();
    };
  }, []);
  useEffect(() => {
    if (progressBarLoadingState === LOADING_STATE.COMPLETED && interval !== 0) {
      clearInterval(interval);
      resetProgressBar();
      setInter(0);
    }
  }, [progressBarLoadingState]);
  return (
    <div>
      {/* Render the progress bar component with custom styles */}
      <div
        style={{
          margin: '15px',
          border: '1px',
          borderRadius: '5px',
          height: '8px',
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
        }}
      >
        Progress Bar One
      </div>
      <ProgressBarComponent
        progressBarContainerStyle={{
          width: '90vw',
          height: '25px',
          border: '1px solid #9E7EA5',
          backgroundColor: '#F6EDE8',
        }}
        progressBarElementStyle={{
          backgroundColor: '#9E7EA5',
          margin: '4px 4px',
          height: '17px',
          transition: 'width 1s ease-in-out',
        }}
      />
      {/* Display the current loading state */}
      <div
        style={{
          margin: '10px',
          border: '1px',
          borderRadius: '5px',
          height: '8px',
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
        }}
      >
        Loading State: {progressBarLoadingState}
      </div>
    </div>
  );
}

export default ProgressBarOne;