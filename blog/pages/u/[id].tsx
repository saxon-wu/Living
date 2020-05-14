import { GetServerSideProps } from "next";
import { BaseContext } from "next/dist/next-server/lib/utils";
import { queryUserService } from "../../lib/services/user.service";
import { AVATAR_LG, AVATAR_XL } from "../../lib/contants";
import Layout from "../../components/Layout";
import Container from "../../components/Container";
import classNames from "classnames";

type Props = {
  user: any;
};

const Profile: React.FunctionComponent<Props> = ({ user }) => {
  return (
    <>
      <Layout>
        <div
          className="absolute top-0 w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: `url(${user.avatar?.url + AVATAR_XL})`,
          }}
        >
          <span className="w-full h-full absolute opacity-50 bg-gradient-tr-primary-2"></span>
        </div>
        <Container full={true}>
          <section className="relative block" style={{ height: "300px" }}>
            <div
              className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
              style={{ height: "70px", transform: "translateZ(0)" }}
            >
              <svg
                className="absolute bottom-0 overflow-hidden"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                version="1.1"
                viewBox="0 0 2560 100"
                x="0"
                y="0"
              >
                <polygon
                  className="text-gray-300 fill-current"
                  points="2560 0 2560 100 0 100"
                ></polygon>
              </svg>
            </div>
          </section>
          <section className="relative py-16 bg-gray-300">
            <div className="container mx-auto px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
                <div className="px-6">
                  <div className="flex flex-wrap justify-center">
                    <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                      <div className="relative">
                        <img
                          alt={user.username}
                          src={`${user.avatar?.url}${AVATAR_LG}`}
                          className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16"
                          style={{ maxWidth: "150px" }}
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                      <div className="py-6 px-3 mt-32 sm:mt-0">
                        <button
                          className="bg-primary-1 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1"
                          type="button"
                          style={{ transition: "all .15s ease" }}
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                    <div className="w-full lg:w-4/12 px-4 lg:order-1">
                      <div className="flex justify-center py-4 lg:pt-4 pt-8">
                        <div className="mr-4 p-3 text-center">
                          <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                            {user.articlesCount}
                          </span>
                          <span className="text-sm text-gray-500">文章</span>
                        </div>
                        <div className="mr-4 p-3 text-center">
                          <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                            {user.likeArticlesCount}
                          </span>
                          <span className="text-sm text-gray-500">点赞</span>
                        </div>
                        <div className="lg:mr-4 p-3 text-center">
                          <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                            {user.favoritesCount}
                          </span>
                          <span className="text-sm text-gray-500">收藏</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-12">
                    <h3 className="text-4xl font-semibold leading-normal mb-2 text-gray-800 mb-2">
                      {user.username}
                    </h3>
                    <div className="text-sm leading-normal mt-0 mb-2 text-gray-500 font-bold uppercase">
                      <i className="fas fa-map-marker-alt mr-2 text-lg text-gray-500"></i>
                      Subtitle
                    </div>
                    <div className="mb-2 text-gray-700 mt-10">
                      <i className="fas fa-briefcase mr-2 text-lg text-gray-500"></i>
                      Goodidea
                    </div>
                    <div className="mb-2 text-gray-700">
                      <i className="fas fa-university mr-2 text-lg text-gray-500"></i>
                      Yes,I can do it.
                    </div>
                  </div>
                  <div className="mt-10 py-10 border-t border-gray-300 text-center">
                    <div className="flex flex-wrap justify-center">
                      <div className="w-full lg:w-9/12 px-4">
                        <p className="mb-4 text-lg leading-relaxed text-gray-800">
                          More Subject...
                        </p>
                        <a
                          href="#pablo"
                          className="font-normal text-primary-1"
                          onClick={(e) => e.preventDefault()}
                        >
                          Show more
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 py-10 border-t text-center">
                    <button
                      className={classNames(
                        "px-2 py-1 border-b-2 border-gray-400 text-gray-500 hover:opacity-75 focus:outline-none hover:opacity-75 text-xs",
                        {
                          "border-primary-1 text-primary-1": true,
                        }
                      )}
                    >
                      文章
                    </button>{" "}
                    <button
                      className={classNames(
                        "px-2 py-1 border-b-2 border-gray-400 text-gray-500 hover:opacity-75 focus:outline-none hover:opacity-75 text-xs",
                        {
                          "border-primary-1 text-primary-1": false,
                        }
                      )}
                    >
                      动态
                    </button>{" "}
                    <button
                      className={classNames(
                        "px-2 py-1 border-b-2 border-gray-400 text-gray-500 hover:opacity-75 focus:outline-none hover:opacity-75 text-xs",
                        {
                          "border-primary-1 text-primary-1": false,
                        }
                      )}
                    >
                      最新评论
                    </button>{" "}
                    <button
                      className={classNames(
                        "px-2 py-1 border-b-2 border-gray-400 text-gray-500 hover:opacity-75 focus:outline-none hover:opacity-75 text-xs",
                        {
                          "border-primary-1 text-primary-1": false,
                        }
                      )}
                    >
                      热门
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Container>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: BaseContext
) => {
  const { params } = context;

  const { results } = await queryUserService({ id: params.id });

  return {
    props: {
      user: {
        ...results,
      },
    },
  };
};

export default Profile;
