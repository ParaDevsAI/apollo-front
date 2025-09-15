import home from "@/assets/images/navbar/feathers/home.svg";

export function getFooterLinks() {
  return [
    {
      label: "Home",
      href: "#home",
      feather: { 
        src: home, 
        width: 56, 
        height: 10 
      },
    },
    {
      label: "Privacy & Policy",
      href: "",
      feather: { 
        src: home, 
        width: 120, 
        height: 7 
      },
    },
    {
      label: "Terms & Condition",
      href: "",
      feather: { 
        src: home, 
        width: 44, 
        height: 7 
      },
    }
  ];
}