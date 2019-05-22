import { transitionTo } from "./router";

export const Link = (props: { to: string; children?: any }) => {
  const handleLinkClick = e => {
    e.preventDefault();
    transitionTo(props.to);
    return false;
  };

  return (
    <a onClick={handleLinkClick} href={props.to}>
      {props.children}
    </a>
  );
};
