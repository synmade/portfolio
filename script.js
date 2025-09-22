// Toggle mobile nav
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Highlight active nav link
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const links = document.querySelectorAll(".nav-links a");

links.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});
