function embedHypothesis() {
  const el = document.createElement("script");
  el.src = "https://hypothes.is/embed.js";
  document.body.append(el);
  button.remove();
}

const button = document.createElement("button");
button.innerText = "annotation mode";
button.onclick = embedHypothesis;
document.getElementsByClassName("bottom-of-page").item(0).append(button);
