import { Application } from "pixi.js";
import { gameStart } from "./game";
import { generateBackgroundSpots, drawBackground } from "./object/background";
import { getRandomVibrantColor } from "./object/snake";
import { Snake } from "./object/snake";
import { Food } from "./object/food";

// Create a new application
export const app = new Application();

(async () => {
  /*
    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: window });
    // Append the application canvas to the document body
    document.getElementById("pixi-container")!.appendChild(app.canvas);
  */
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');

  if (ctx) {
    // ctx.fillStyle = '#RRGGBB'; // Replace RRGGBB with your desired hex color code
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    generateBackgroundSpots();
    drawBackground(canvas, ctx);

    const randomColor = getRandomVibrantColor();
    const snake = new Snake(600, 256, randomColor); // used ONLY for drawing reference defaults
    snake.draw(ctx);

    const food = new Food(50, 50);
    food.draw(ctx);
  }

  // Name input handling
  const nameInput = document.getElementById("fname") as HTMLInputElement;
  const startButton = document.getElementById("bstart") as HTMLButtonElement;

  // Disable start button initially
  startButton.disabled = true;

  // Enable/disable start button based on name input
  nameInput?.addEventListener("input", () => {
    if (nameInput.value.trim().length > 0) {
      startButton.disabled = false;
      startButton.style.opacity = "1";
    } else {
      startButton.disabled = true;
      startButton.style.opacity = "0.5";
    }
  });

  // Button click
  startButton?.addEventListener("click", async () => {
    if (nameInput && nameInput.value.trim()) {
      // Store the player name for the game
      (window as any).playerName = nameInput.value.trim();
      await gameStart();
      (document.getElementById("startup") as HTMLElement).style.display = "none";
      (document.getElementById("gameCanvas") as HTMLElement).style.display = "none";
      (document.getElementById("start_btn_containeer") as HTMLElement).style.display = "none";
      (document.getElementById("app") as HTMLElement).style.display = "flex";
    }
  });
})();
