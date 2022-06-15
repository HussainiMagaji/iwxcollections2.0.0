document.addEventListener("DOMContentLoaded", async function() {
  let res = await fetch('/invoice');
  let blob = await res.blob( );
  const blob_url = URL.createObjectURL(blob);

  window["invoice"].src = blob_url;
  window["download_btn"].href = blob_url;
});
