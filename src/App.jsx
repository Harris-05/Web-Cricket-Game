import { useState, useEffect, useRef } from "react";


const PROBABILITIES = {
  Aggressive: [
    { outcome: "Wicket", prob: 0.40, color: "red" },      
    { outcome: "0", prob: 0.10, color: "gray" },          
    { outcome: "1", prob: 0.10, color: "green" },         
    { outcome: "2", prob: 0.10, color: "yellow" },        
    { outcome: "3", prob: 0.05, color: "orange" },        
    { outcome: "4", prob: 0.10, color: "darkorange" },    
    { outcome: "6", prob: 0.15, color: "purple" },       
  ],
  Defensive: [
    { outcome: "Wicket", prob: 0.10, color: "red" },
    { outcome: "0", prob: 0.30, color: "gray" },
    { outcome: "1", prob: 0.30, color: "green" },
    { outcome: "2", prob: 0.20, color: "yellow" },
    { outcome: "3", prob: 0.05, color: "orange" },
    { outcome: "4", prob: 0.05, color: "darkorange" },
    { outcome: "6", prob: 0.00, color: "purple" },
  ]
};

function App() {
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [style, setStyle] = useState("Defensive");
  
  
  const [sliderPos, setSliderPos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastAction, setLastAction] = useState("");
  
  const sliderDirection = useRef(1); 

  
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSliderPos((prev) => {
        let nextPos = prev + (0.02 * sliderDirection.current);
        if (nextPos >= 1) {
          nextPos = 1;
          sliderDirection.current = -1;
        } else if (nextPos <= 0) {
          nextPos = 0;
          sliderDirection.current = 1;
        }
        return nextPos;
      });
    }, 50); 

    return () => clearInterval(interval);
  }, [gameOver]);

  // 3. Play Shot Logic [cite: 46, 78, 80]
  const playShot = () => {
    if (gameOver) return;

    const currentProbs = PROBABILITIES[style];
    let cumulativeProb = 0;
    let result = "";

    // Determine outcome based on slider position [cite: 80]
    for (let segment of currentProbs) {
      cumulativeProb += segment.prob;
      if (sliderPos <= cumulativeProb) {
        result = segment.outcome;
        break;
      }
    }

    setLastAction(`You scored: ${result}`);
    processOutcome(result);
  };

  const processOutcome = (result) => {
    let newBalls = balls + 1;
    setBalls(newBalls);

    let newWickets = wickets;
    let newRuns = runs;

    if (result === "Wicket") {
      newWickets += 1;
      setWickets(newWickets);
    } else {
      newRuns += parseInt(result);
      setRuns(newRuns);
    }

    // Game Progression Logic: 2 overs (12 balls) or 2 wickets [cite: 51, 52, 53, 83, 84]
    if (newBalls >= 12 || newWickets >= 2) {
      setGameOver(true);
      setLastAction(`Game Over! Final Score: ${newRuns}/${newWickets}`);
    }
  };

  const handleRestart = () => {
    setRuns(0);             // [cite: 55]
    setWickets(0);          // [cite: 56]
    setBalls(0);            // [cite: 57]
    setStyle("Defensive");  // [cite: 58]
    setGameOver(false);
    setLastAction("");
    setSliderPos(0);
  };

  return (
    <div className="container">
      <h1>🏏 2D Cricket Game</h1>
      
      <div className="scoreboard">
        <h2>Scoreboard</h2>
        <p>Runs: {runs}</p>
        <p>Wickets: {wickets}</p>
        <p>Balls: {balls} / 12</p>
        <p>Style: {style}</p>
      </div>

      {/* Temporary visual output for the slider to verify it works */}
      <div style={{ margin: "20px 0" }}>
        <p>Slider Position: {sliderPos.toFixed(2)}</p>
        <h3>{lastAction}</h3>
      </div>

      <div className="controls">
        <button onClick={() => setStyle("Aggressive")} disabled={gameOver}>
          Aggressive
        </button>
        <button onClick={() => setStyle("Defensive")} disabled={gameOver}>
          Defensive
        </button>
        <button onClick={playShot} disabled={gameOver}>
          Play Shot
        </button>
        <button onClick={handleRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default App;