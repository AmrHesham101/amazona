import Link from "next/link";
import React, { forwardRef } from "react";

const DropdownLink = forwardRef((props, ref) => {
  let { href, children, ...rest } = props;
  return (
    <Link ref={ref} href={href} {...rest}>
      {children}
    </Link>
  );
});
DropdownLink.displayName = "DropdownLink";
export default DropdownLink;
