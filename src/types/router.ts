export type RouterElement = {
  name: string;
  screens: {
    name: string;
    component: any;
    bottomTabIcon?: (props: object) => JSX.Element;
  }[];
};
