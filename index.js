const tutPopup = document.getElementById("tutPopup")

// Making TUTORIAL button to open/close tutorial popup
function openTutorial(){
    if(tutPopup.style.display == 'block'){
        tutPopup.style.display = ''
    }
    else{
        tutPopup.style.display = 'block'
    }
}

gameloop() // Calling gameloop function