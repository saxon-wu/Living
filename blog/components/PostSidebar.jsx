const PostSidebar = () => {
  return (
    <>
      <div className="w-full md:w-64 text-sm text-inverse-soft">

        <aside className="rounded shadow overflow-hidden mb-6">
          <h3 className="relative text-white py-3 px-4 border-b bg-gradient-br-primary-2">
            推荐作者
          </h3>

          <div className="p-4">
            <ul className="list-reset leading-normal">
              <li>
                <a href="#">Uncategorised</a>
              </li>
              <li>
                <a href="#">Food &amp; Drink</a>
              </li>
              <li>
                <a href="#">Garden</a>
              </li>
              <li>
                <a href="#">Tools</a>
              </li>
            </ul>
          </div>
        </aside>

        <aside className="rounded shadow overflow-hidden mb-6">
          <h3 className="relative text-white py-3 px-4 border-b bg-gradient-br-primary-2">
            最新发布
          </h3>

          <div className="p-4 bg-inverse">
            <ul className="list-reset leading-normal">
              <li>
                <a href="#">Lorem ipsum dolor sit amet.</a>
              </li>
              <li>
                <a href="#">Sit amet, consectetur adipisicing elit.</a>
              </li>
              <li>
                <a href="#">Lorem ipsum dolor sit amet.</a>
              </li>
              <li>
                <a href="#">Sit amet, consectetur adipisicing elit.</a>
              </li>
            </ul>
          </div>
        </aside>

      </div>
      <style jsx>{`
        h3:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>
    </>
  );
};

export default PostSidebar;
