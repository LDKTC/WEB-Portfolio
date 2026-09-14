document.addEventListener("DOMContentLoaded", () => {

    fetch("/ref/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;
        })
        .catch(error => {
            console.error("ไม่สามารถโหลด Navbar ได้:", error);
        });

});
