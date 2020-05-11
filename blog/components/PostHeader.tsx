import Avatar from "./Avatar";
import Date from "./Date";
import PostTitle from "./PostTitle";
import { DayTypeEnum } from "../lib/enum";
import { AVATAR_SM } from "../lib/contants";
import Link from "next/link";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: { id: string; username: string; avatar: any };
};

const PostHeader: React.FunctionComponent<Props> = ({
  title,
  coverImage,
  date,
  author,
}) => {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:block md:mb-12">
        <Link as={`/u/${author.id}`} href="/u/[id]">
          <a>
            <Avatar
              name={author.username}
              picture={author.avatar.url + AVATAR_SM}
            />
          </a>
        </Link>
      </div>
      {coverImage && (
        <div className="mb-8 md:mb-16 -mx-5 sm:mx-0">
          <img src={coverImage} alt="封面图" />
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-lg">
          更新于 <Date dateString={date} dayType={DayTypeEnum.NORMAL} />
        </div>
      </div>
    </>
  );
};
export default PostHeader;
