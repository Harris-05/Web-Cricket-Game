import { useState, useEffect, useRef } from "react";

// 1. Define Probabilities [cite: 41, 42]
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
  
  // Animation States
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBatting, setIsBatting] = useState(false);

  const sliderDirection = useRef(1); 
  const playButtonRef = useRef(null); 

  // Moving Slider Logic [cite: 45]
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

  // Spacebar Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault(); 
        if (playButtonRef.current && !gameOver && !isAnimating) {
          playButtonRef.current.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, isAnimating]);

  // Play Shot Logic
  const playShot = () => {
    if (gameOver || isAnimating) return;
    setIsAnimating(true); // Start the bowling animation 

    const currentProbs = PROBABILITIES[style];
    let cumulativeProb = 0;
    let result = "";

    // Determine outcome based strictly on slider position [cite: 46, 47]
    for (let segment of currentProbs) {
      cumulativeProb += segment.prob;
      if (sliderPos <= cumulativeProb) {
        result = segment.outcome;
        break;
      }
    }

    // Trigger Batting Swing just before the ball reaches the batsman 
    setTimeout(() => {
      setIsBatting(true);
    }, 400);

    // End animation and process the result
    setTimeout(() => {
      setIsAnimating(false);
      setIsBatting(false);
      setLastAction(`Outcome: ${result}`);
      processOutcome(result);
    }, 700);
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

    // Game Progression Logic [cite: 51, 52, 53]
    if (newBalls >= 12 || newWickets >= 2) {
      setGameOver(true);
      setLastAction(`Game Over! Final Score: ${newRuns}/${newWickets}`);
    }
  };

  // Restart Option [cite: 54]
  const handleRestart = () => {
    setRuns(0);             
    setWickets(0);          
    setBalls(0);            
    setStyle("Defensive");  
    setGameOver(false);
    setLastAction("");
    setSliderPos(0);
    setIsAnimating(false);
    setIsBatting(false);
  };

  return (
    <div className="container" style={{ fontFamily: "sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>🏏 2D Cricket Game</h1>
      
      {/* Scoreboard [cite: 33, 34, 35] */}
      <div className="scoreboard" style={{ display: "flex", justifyContent: "space-around", backgroundColor: "#333", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <p><strong>Runs:</strong> {runs}</p>
        <p><strong>Wickets:</strong> {wickets}</p>
        <p><strong>Overs:</strong> {Math.floor(balls / 6)}.{balls % 6} (Max: 2.0)</p>
        <p><strong>Style:</strong> {style}</p>
      </div>

      {/* 2D Cricket Ground Layout  */}
      <div style={{ 
        width: "100%", 
        height: "250px", 
        backgroundColor: "#4CAF50", // Grass Green
        borderRadius: "100px / 50px", // Oval boundary look
        position: "relative",
        border: "5px solid white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        {/* Pitch Area */}
        <div style={{
          width: "70%",
          height: "60px",
          backgroundColor: "#d2b48c", // Pitch khaki/tan
          border: "2px solid #8b4513",
          position: "relative"
        }}>
          {/* Crease lines */}
          <div style={{ position: "absolute", left: "15%", top: "0", bottom: "0", borderLeft: "2px solid white" }} />
          <div style={{ position: "absolute", right: "15%", top: "0", bottom: "0", borderRight: "2px solid white" }} />

          {/* Batsman & Bat  */}
          <div style={{ 
            position: "absolute", 
            left: "5%", 
            top: "5px", 
            fontSize: "35px",
            transform: isBatting ? "rotate(-60deg) translateX(-10px)" : "rotate(0deg)", // Batting Animation [cite: 49]
            transition: "transform 0.15s ease-in-out",
            zIndex: 2
          }}>
            🏏
          </div>

          {/* Bowler */}
          <div style={{ position: "absolute", right: "5%", top: "10px", fontSize: "30px" }}>
            🧍‍♂️
          </div>

          {/* Ball  */}
          <div style={{
            position: "absolute",
            top: "25px",
            right: isAnimating ? "85%" : "15%", // Ball travels toward batsman [cite: 48]
            width: "12px",
            height: "12px",
            backgroundColor: "white",
            borderRadius: "50%",
            boxShadow: "0 0 3px black",
            transition: isAnimating ? "right 0.5s linear" : "none", // Smooth bowling animation
            opacity: (isAnimating || gameOver) ? 1 : 0 // Hide ball when not bowling
          }} />
        </div>
      </div>

      {/* Visual Power Bar [cite: 40, 43] */}
      <div style={{ margin: "30px 0", textAlign: "center" }}>
        <h3>Power Bar</h3>
        
        <div style={{ 
          position: "relative", width: "100%", height: "40px", display: "flex", 
          border: "3px solid #333", borderRadius: "5px", overflow: "hidden", backgroundColor: "#eee"
        }}>
          {/* Mapped Segments [cite: 44] */}
          {PROBABILITIES[style].map((segment, index) => (
            <div key={index} style={{
              width: `${segment.prob * 100}%`,
              backgroundColor: segment.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: "bold", fontSize: "14px", textShadow: "1px 1px 2px black"
            }}>
              {segment.prob > 0 ? segment.outcome : ""}
            </div>
          ))}

          {/* Moving Slider overlay [cite: 45] */}
          <div style={{
            position: "absolute", top: "-5px", bottom: "-5px",
            left: `${sliderPos * 100}%`, width: "6px", backgroundColor: "black",
            border: "1px solid white", transform: "translateX(-50%)", 
            zIndex: 10, transition: "left 0.05s linear" 
          }} />
        </div>

        <h2 style={{ marginTop: "20px", color: resultColor(lastAction) }}>{lastAction}</h2>
      </div>

      {/* Controls */}
      <div className="controls" style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <button 
          onClick={() => setStyle("Aggressive")} 
          disabled={gameOver || isAnimating}
          style={{ padding: "10px 20px", backgroundColor: style === "Aggressive" ? "#ff4d4d" : "#ccc", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          Aggressive [cite: 36]
        </button>
        <button 
          onClick={() => setStyle("Defensive")} 
          disabled={gameOver || isAnimating}
          style={{ padding: "10px 20px", backgroundColor: style === "Defensive" ? "#4d79ff" : "#ccc", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          Defensive [cite: 36]
        </button>
        <button 
          ref={playButtonRef} 
          onClick={playShot} 
          disabled={gameOver || isAnimating} 
          style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          Play Shot (Spacebar)
        </button>
        <button 
          onClick={handleRestart}
          style={{ padding: "10px 20px", backgroundColor: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}

// Helper function to color the outcome text
function resultColor(actionText) {
  if (actionText.includes("Wicket")) return "red";
  if (actionText.includes("4") || actionText.includes("6")) return "green";
  return "#333";
}

export default App;