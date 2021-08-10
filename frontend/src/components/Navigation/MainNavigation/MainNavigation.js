import { NavLink } from "react-router-dom";
import NavigationItems from "../Navigationtems/NavigationItems";
import "./MainNavigation.css";

const mainNavigation = props => (
    <nav className="main-nav">
        <div className="main-nav_home">
            <NavLink to="/">
              <h1 className="logo">BLOGIt</h1>
            </NavLink>
        </div>
        <div className="spacer"/>
        <ul className="main-nav_items">
            <NavigationItems onLogout={props.onLogout} />
        </ul>
    </nav>
);

export default mainNavigation;

