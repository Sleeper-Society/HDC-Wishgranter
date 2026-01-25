let input = document.getElementById("hyperspace_file_location_input");
let game_start_button = document.getElementById("hyperspace_file_location_button");
game_start_button.addEventListener('click', () => {
    steam.beginGame(input.value);
});
steam.findSteamApp('2711190').then(response => {
    input.setAttribute("value", response);
})


