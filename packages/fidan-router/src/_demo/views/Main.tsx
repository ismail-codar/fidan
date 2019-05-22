import { Router, transitionTo } from "../../lib/router";
import { Route } from "../../lib/route";
import { Home } from "../pages/Home";
import { Page1 } from "../pages/Page1";
import { Page2 } from "../pages/Page2";
import { Link } from "../../lib/link";

export const Main = () => {
  window.requestAnimationFrame(() => {
    transitionTo("/");
  });
  return (
    <div>
      <Link to="/"> Home </Link>
      <Link to="/page1"> Page1 </Link>
      <Link to="/page2"> Page2 </Link>
      <hr />
      <Router>
        <Route path="/" component={Home} />
        <Route path="/page1" component={Page1} />
        <Route path="/page2" component={Page2} />
      </Router>
    </div>
  );
};
