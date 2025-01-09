const submitButton = document.getElementById("submit-btn");
const errorContainer = document.getElementById("error-container");
const outputDiv = document.getElementById("output");
const captchaContainer = document.getElementById("captcha-container");

let captchaResolved = false;

// Initialisation : cacher le CAPTCHA au début
captchaContainer.style.display = "none";

const captchaApiKey = process.env.NEXT_PUBLIC_AWS_CAPTCHA_API_KEY;

// Fonction pour effectuer l'appel GET à l'API
async function fetchWhoAmI() {
    try {
        const response = await fetch("https://api.prod.jcloudify.com/whoami");
        if (!response.ok) {
            // Si la réponse n'est pas correcte, on retourne "Forbidden"
            return "Forbidden";
        }
        const data = await response.json();
        return data.message || "Authorized"; // Exemple si une clé "message" existe
    } catch (error) {
        return "Forbidden"; // Retourner "Forbidden" en cas d'erreur
    }
}

const form = document.getElementById("sequence-form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const number = parseInt(document.getElementById("number").value);

    // Validation de l'entrée utilisateur
    if (isNaN(number) || number < 1 || number > 1000) {
        errorContainer.textContent = "Veuillez entrer un nombre valide entre 1 et 1000.";
        return;
    }

    errorContainer.textContent = "";
    outputDiv.textContent = "";

    // Générer un numéro aléatoire entre 10 et N pour afficher le CAPTCHA
    const captchaTriggerIndex = Math.floor(Math.random() * (number - 10 + 1)) + 10;

    for (let i = 1; i <= number; i++) {
        // Appel à l'API avant d'écrire la ligne
        const apiResult = await fetchWhoAmI();

        // Écrire la ligne avec le résultat "Forbidden"
        outputDiv.textContent += `${i}. ${apiResult}\n`;

        // Vérifier si le CAPTCHA doit être affiché
        if (i === captchaTriggerIndex && !captchaResolved) {
            outputDiv.textContent += "\nValidez le CAPTCHA pour continuer...\n";

            // Afficher le CAPTCHA à ce moment-là
            captchaContainer.style.display = "block";

            // Initialiser le CAPTCHA
            AwsWafCaptcha.renderCaptcha(captchaContainer, {
                apiKey: "Vj+zI0yXNF4pXBz7RAqmqf7maOlG2lxDTyW181fohXJvWl2bEtqQgX4ntQFB6R/Lp0ixOKN7zNwYyAnX+8k6SyCwRr20wJDxGyISu0nHWcSPkZHPmF6uacJ501ht51PvvzhN2sjnHljl/3piUHukdJW5undMK3tq3I0sFXUinhmxLh5JFCPIvBfIXEDwbWq12I6dobs95GsHan+5elze8MD7Mg7EyCKrCmC1f6eVja4qN8aGtwMl40llH+UJyoJJJDSto9Wvk9IL0RiJPIBtkF4Hop1NkCCFkAkiikueAO5VWhC3Yx5N1NCSo/oCsL9rgrCTwJL7f4dOm5snMyeT9p96UhBph+hXkSB+qrkdB7Uq3cNBALSDNrTSki1fugjjfiQN3ExjkT8qKoK5SbCQDKFBuCZtXQLEoE+TtRgqqFHMiSs4pJkDWfiBs14wc+H0Ps+TgjlL0tejeNpFYZz+Y8E9MaM336sy+TDz54zulnFUuWWIqdLWz33W5ecQoB8Z86MxheASd4HxrFcTZvWlquogbVrPenu4lreBv6oz0en0k0V1UBJ8a4fy7TlaJXcCcZ6IUFn0WdxeN+a9tnhPDKjEWIfpjgWlLZ5uoHcUlUHtHKtBJjvySGZvvywua8LTfZ+GnD5CkouDqqgGaP/S3syoO1vbqO2amrjJfKKgBu8=_0_1",
                onSuccess: () => {
                    captchaResolved = true;
                    captchaContainer.style.display = "none";
                    errorContainer.textContent = "";
                },
                onError: (error) => {
                    errorContainer.textContent = error.message;
                },
            });

            // Attendre que le CAPTCHA soit résolu
            while (!captchaResolved) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }

        // Pause de 1 seconde entre chaque affichage
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    outputDiv.textContent += "\nSéquence terminée.";
});
