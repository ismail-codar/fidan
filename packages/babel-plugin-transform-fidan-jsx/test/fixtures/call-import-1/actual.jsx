import { controller } from "./types";
var filteredData$ = gridData;

const Grid1 = props => {
  controller.sortBy(filteredData$);
};
