const submitButton = document.getElementById("submit-btn");
const errorContainer = document.getElementById("error-container");
const outputDiv = document.getElementById("output");
const captchaContainer = document.getElementById("captcha-container");

let captchaResolved = false;

// Initialisation : cacher le CAPTCHA au début
captchaContainer.style.display = "none";

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
                apiKey: "rpFv5laMXyVO+DkSGnm53mhOyLcilvIc9JaMYkmAwpmdfIrnGhugkhEUtLHTe8UYvAq/nQ9tWDXAtxw6cc543tSienTdFm3QlAXUSmTOpING+p9WIuQHmvwTJM2kIMoRqmFzpepFGYXKTMClSBYdQXxSrkWSVgzdD0taWoCzVQa2oUE8NRNfWQEochbpw4d6kYfMD1+tKGDBtV5QPt6XLVdUJIstiK02ohEL+djWPCMCSIApWz/ffyBmf5t1SRM5Z6LkDgnPDnu2wBCHJTAoHG10DF/HO0b5l85PtDXa6rqdohuxbIz5zur/p3Yp2FiXUApocRk0OOF9gD4MNOVtlUuwwdsaSgBPBwk6kn+H8tZi+Pjq0IRSUfAh1QqfWzFLgYftXtzbCpwY2rsYqrVZ6JSuUZGSaWZURjS2ctrxDYOi+TTTMV3KnNIfTvAu2ueV6+/KmcrBSXKHD/brUhAbN0R5D499FBySIKtfF5aJPBS76QtHu4UFgDaeabeKqUiUOnOSk8Vr7b1DN8UptGey4eZuHhQqYePudWX8so9dqX88QAK1boEw7Ffi/m1QEF1EsWAWfnWXAlsqPPRA7i3uHo8jgZS93r+e0y6Usizcxi977rdlN9NjMF/avrGywFBelLbalojWHDDjvJhgJGAhr1Jz6uabVzhAPhN5GtRWXzA=_0_1",
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
