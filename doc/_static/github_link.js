const link = document.createElement("a");
link.href = "https://github.com/skn0tt/datapact";
link.innerText = "GitHub";
link.style.padding = "0px var(--sidebar-item-spacing-horizontal)";
link.style.paddingBottom = "var(--sidebar-item-spacing-vertical)";
link.style.color = "var(--color-foreground-secondary)";
link.style.textDecoration = "none";

document.getElementsByClassName("sidebar-brand").item(0).after(link);
