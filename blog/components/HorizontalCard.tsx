import Link from "next/link";
import Date from "../components/Date";
import { DayTypeEnum } from "../lib/enum";
import { AVATAR_SM } from "../lib/contants";

type Props = {
  data: {
    id: string;
    title: string;
    content: {
      blocks: Array<{
        type: string;
        data: {
          text: string;
        };
      }>;
    };
    publisher: {
      username: string;
      avatar: { url: string };
    };
    cover: {
      url: string;
    };
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    likes: Array<{
      id: string;
      username: string;
      avatar: {
        url: string;
      };
      bookmarks: any[] | null;
      articles: any[] | null;
      likeArticles: any[] | null;
      bookmarksCount: number;
      articlesCount: number;
      likeArticlesCount: number;
    }>;
  };
};

const HorizontalCard: React.FunctionComponent<Props> = ({ data }) => {
  const {
    id,
    title,
    content,
    publisher,
    cover,
    createdAt,
    likesCount,
    commentsCount,
    likes,
  } = data;

  return (
    <div className="flex items-stretch bg-gray-100 h-48 rounded-lg mb-2">
      <div
        className="flex-none px-4 py-2 m-2 w-24 bg-cover overflow-hidden rounded-lg"
        style={{
          backgroundImage: `url(${
            cover?.url ?? "https://www.tailwindcss.cn/img/card-left.jpg"
          })`,
        }}
        title="Woman holding a mug"
      ></div>
      <div className="flex-1 flex bg-white px-4 py-2 m-2 flex-col justify-between leading-normal rounded-lg">
        <div className="mb-3">
          <div className="text-gray-900 font-bold text-lg mb-1">
            <Link as={`/p/${id}`} href="/p/[id]">
              <a className="hover:underline">{title}</a>
            </Link>
          </div>
          <p className="text-gray-500 text-sm Y-describe">{`${content?.blocks[0]?.data?.text} ${content?.blocks[1]?.data?.text}`}</p>
        </div>
        <div className="flex items-center overflow-hidden">
          <img
            className="w-5 h-5 rounded-full mr-1"
            src={publisher?.avatar.url + AVATAR_SM}
            alt="Avatar of Jonathan Reinink"
          />
          <div className="text-xs">
            <p className="text-gray-900 leading-none">
              {publisher?.username ?? "匿名"}
            </p>
          </div>
          <div className="text-xs text-gray-600 flex items-center ml-4 whitespace-no-wrap">
            {likes?.map((v, index) => (
              <img
                key={index}
                className={`h-5 w-5 rounded-full border-1 -ml-${index ? 2 : 0}`}
                src={v.avatar.url + AVATAR_SM}
              />
            ))}
            <svg
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />
            </svg>
            {likesCount}
          </div>
          <div className="text-xs text-gray-600 flex items-center ml-4 whitespace-no-wrap">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {commentsCount}
          </div>
          <div className="text-xs text-gray-600 flex items-center ml-4 whitespace-no-wrap">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>

            <Date dateString={createdAt} dayType={DayTypeEnum.FROMNOW} />
          </div>
        </div>
      </div>
      <style jsx>{`
        .Y-describe {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default HorizontalCard;
