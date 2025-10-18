const floorButtons = document.querySelectorAll(".floor-selector button");
const map3F = document.getElementById("map3F");
const map4F = document.getElementById("map4F");

floorButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const floor = btn.dataset.floor;

    // Hide all maps by default
    map3F.style.display = "none";
    map4F.style.display = "none";

    if (floor === "3") {
      map3F.style.display = "flex";
    } else if (floor === "4") {
      map4F.style.display = "flex";
    }
    // Optional: handle 'all' floor later
  });
});
