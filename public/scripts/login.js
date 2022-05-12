{//================================================

document.addEventListener("DOMContentLoaded", ( ) => {
    if(!window["error_message"].textContent.trim( )) {
        window["error_message"].textContent = "";
    } else {
        alert(window["error_message"].textContent.trim( ));
        window["error_message"].textContent = "";
    }
});

}//=================================================