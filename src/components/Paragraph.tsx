import { ReactNode } from "react";

type ParagraphProps = {
  children: ReactNode;
};

function Paragraph({ children }: ParagraphProps) {
  return (
    <p className="mb-4 text-sm leading-relaxed text-gray-300 sm:text-base sm:leading-loose">
      {children}
    </p>
  );
}

export default Paragraph;
