import home from "@/assets/images/navbar/feathers/home.svg";

export function getNavbarLinks() {
  return [
    {
      label: "Home",
      href: "#home",
      feather: { 
        src: home, 
        width: 44, 
        height: 7 
      },
    }
  ];
}