import Avatar from "./Avatar";
import Date from "./Date";
import PostTitle from "./PostTitle";
import { DayTypeEnum } from "../lib/enum";
import { AVATAR_SM, COVER_MD_HORIZONTAL } from "../lib/contants";
import Link from "next/link";

type Props = {
  title: string;
  cover: { url: string };
  date: string;
  author: { id: string; username: string; avatar: any };
};

const PostHeader: React.FunctionComponent<Props> = ({
  title,
  cover,
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
      {cover && (
        <div className="mb-8 md:mb-16 -mx-5 sm:mx-0">
          <img src={cover.url + COVER_MD_HORIZONTAL} alt="封面图" />
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
