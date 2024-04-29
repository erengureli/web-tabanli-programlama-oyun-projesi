const tutPopup = document.getElementById("tutPopup")

// TUTORIAL butonuna basınca tutorial pupup'ını aç/kapa yapıyor
function openTutorial(){
    if(tutPopup.style.display == 'block'){
        tutPopup.style.display = ''
    }
    else{
        tutPopup.style.display = 'block'
    }
}

gameloop() // gameloop fonksiyonunu çağırıyo