import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { DayTypeEnum } from "../lib/enum";
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

type Props = {
  dateString: string;
  dayType: DayTypeEnum;
};

const Date: React.FunctionComponent<Props> = ({
  dateString,
  dayType,
}) => {
  const d = dayType ? (dayjs(dateString) as any)[dayType]() : dateString;
  return <time dateTime={dateString}>{d}</time>;
};
export default Date;
