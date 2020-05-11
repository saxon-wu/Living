import Layout from "../components/Layout";
import Container from "../components/Container";

type Props = {};

const About: React.FunctionComponent<Props> = () => {
  return (
    <>
      <Layout setNavbarTransparent={true}>
        <Container className="bg-gradient-tl-primary-2">
          <section className="pt-32">
            <div className="text-gray-700 bg-white p-10 rounded-lg">
              <h1 className="font-bold text-center text-xl">
                全栈开源-其一-Blog
              </h1>
              <div className="py-2">
                <h2>Features:</h2>
                <p>
                  1. 使用React服务端渲染
                  <a
                    className="underline hover:text-success duration-200 transition-colors cursor-pointer"
                    href="https://nextjs.org/"
                  >
                    Next.js
                  </a>
                  作为应用框架
                </p>
                <p>
                  2.采用
                  <a
                    href="https://tailwindcss.com"
                    className="underline hover:text-success duration-200 transition-colors cursor-pointer"
                  >
                    TailwindCSS
                  </a>
                  作为CSS框架，免去修改其它组件库样式的烦恼，好处是松散坏处也是松散
                </p>
                <p>3.umi-request作为网络请求库客户端和服务端同构</p>
                <p></p>
                <p></p>
              </div>

              <hr />
              <div className="py-2">
                <h2>Other:</h2>
                <p>
                  本Blog的数据非真实数据，请勿当真，系测试时自动填充二者兼得
                </p>
              </div>

              <div className="py-2">
                <hr />
                <h2>TODO:</h2>
                <p>✔[登录]</p>
                <p>✔[注册]</p>
                <p>✔[发表文章]</p>
                <p>✔[修改文章]</p>
                <p>✊ [删除文章]</p>
                <p>✔[修改头像]</p>
                <p>✊ [修改个人资料]</p>
                <p>✊ [对文章点赞]</p>
                <p>✔[对评论点赞]</p>
                <p>✔[对回复点赞]</p>
                <p>✔[点赞]</p>
                <p>✊ [收藏文章]</p>
                <p>✊ [文章标签]</p>
                <p>✊ [UI优化]</p>
                <p>✊ [业务优化]</p>
                <p>✊ [代码优化]</p>
                <p>✊ [体积优化]</p>
                <p>✊ [NetWork优化]</p>
                <p>✊ [Server控制权限]</p>
                <p>✊ [Many many bugs need to be fixed]</p>
              </div>
            </div>
          </section>
        </Container>
      </Layout>
      <style jsx>{`
        .Y-full-screen:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>
    </>
  );
};

export default About;
