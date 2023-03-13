import { c as create_ssr_component, v as validate_component, b as add_attribute } from "../../../chunks/index3.js";
const dofus = "/_app/immutable/assets/dofus.265f0255.jpg";
const Header_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "header.svelte-18jy8y4{display:flex;align-items:center;justify-content:space-between;position:fixed;top:0;left:0;background-color:#8FBC8F;width:100%;border-bottom:1px solid #ccc;justify-content:center}button.svelte-18jy8y4{background-color:green;border:red;color:white;padding:10px 20px;text-align:right;text-decoration:none;font-size:16px;margin:4px 2px;cursor:pointer;border-radius:5px;transition:background-color 0.3s ease-in-out }button.svelte-18jy8y4:hover{background-color:#6a737d}.header-title.svelte-18jy8y4{margin:0;padding:0;font-size:40px;color:white;text-align:center;margin-left:70px;width:100%;font-family:Lobster;color:#DAA520;text-shadow:3px 3px 0 black}.right.svelte-18jy8y4{display:flex;align-items:center;justify-content:flex-end;margin-left:auto}",
  map: null
};
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<head><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lobster"></head>
<header class="svelte-18jy8y4"><div class="header-title svelte-18jy8y4">Ft_Transcendence</div>
    <div class="right svelte-18jy8y4"><button class="svelte-18jy8y4"><a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ad63634a67eaff34218824a7796fa6e5c5337b11f88c026df3956ba7a8f38dc6&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fhomepage&response_type=code" style="color: white; text-decoration: none;">Login</a></button></div></header>`;
});
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: "img.svelte-fxl5jy{display:block;margin:auto;margin-top:40px}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}



<main>${slots.content ? slots.content({}) : ``}</main>

<div class="image-container"><img${add_attribute("src", dofus, 0)} alt="Dofus" class="svelte-fxl5jy"></div>`;
});
export {
  Layout as default
};
