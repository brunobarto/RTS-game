import { Game } from "./engine/game.js";

window.onload = () => {
    const canvas = document.getElementById("gameCanvas");
    const miniMapCanvas = document.getElementById("miniMap");

    const game = new Game(canvas, miniMapCanvas);
    game.start();
};
