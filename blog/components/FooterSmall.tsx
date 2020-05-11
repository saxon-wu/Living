import classnames from "classnames";

type Props = {
  absolute: boolean;
};

const FooterSmall: React.FunctionComponent<Props> = ({ absolute }) => {
  return (
    <>
      <footer
        className={classnames("pb-6", {
          "absolute w-full bottom-0 bg-gray-900": absolute,
          relative: !absolute,
        })}
      >
        <div className="container mx-auto px-4">
          <hr className="mb-6 border-b-1 border-gray-700" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4">
              <p className="text-sm text-white font-semibold py-1">
                Copyright © {new Date().getFullYear()}{" "}
                <a
                  href="#"
                  className="text-white hover:text-gray-400 text-sm font-semibold py-1"
                >
                  Living Tim
                </a>
              </p>
              <p className="text-sm text-gray-600 font-semibold py-1">
                <a
                  href="http://www.beian.miit.gov.cn/"
                  target="_blank"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {process.env.BEI_AN}
                </a>
              </p>
            </div>
            <div className="w-full md:w-8/12 px-4">
              <ul className="flex flex-wrap list-none md:justify-end  justify-center">
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-400 text-sm font-semibold block py-1 px-3"
                  >
                    Living Tim
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-400 text-sm font-semibold block py-1 px-3"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-400 text-sm font-semibold block py-1 px-3"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white hover:text-gray-400 text-sm font-semibold block py-1 px-3"
                  >
                    MIT License
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterSmall;
