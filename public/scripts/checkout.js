{//==========================================================
let orderForm = document.getElementById("orderForm");
let proceed = document.getElementById("proceed");
let stateHTML = document.getElementById("state");
let lgaHTML = document.getElementById("lga");


async function getLGAs( ) {
  let idx = stateHTML.options.selectedIndex;
  let selected = stateHTML.options[idx];

  Array.from(lgaHTML.options).forEach(option => option.remove());
  fetch(`/lgas/${selected.textContent.trim()}`).
    then(res => res.json()).then(lgas => {
      lgas.forEach(lga => {
        let option = document.createElement("option");
        option.textContent = lga;
        lgaHTML.append(option);
      });
    });
}

document.addEventListener("DOMContentLoaded", getLGAs);
stateHTML.addEventListener("change", getLGAs);

orderForm.addEventListener("submit", function( ) {
  fetch("/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(new FormData(orderForm)).toString( )
  }).then(res => res.text( )).then(paymentForm => {
        document.body.insertAdjacentHTML("beforeend", paymentForm);
        proceed.hidden = true;
  });
});

}//==========================================================
