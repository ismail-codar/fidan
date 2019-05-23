declare module "route-recognizer" {
  export default class RouteRecognizer {
    recognize: (path: string) => any;
    add: (options: any) => void;
  }
}
