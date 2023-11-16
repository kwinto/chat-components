import { FC, useMemo, useState } from "react";
import { ImageMessageContext } from "./context";
import Lightbox from "./lightbox/Lightbox";
import ImageThumb from "./ImageThumb";
import { useMessageContext } from "src/hooks";
import { getChannelPayload } from "src/utils";
import { IWebchatButton } from "@cognigy/socket-client/lib/interfaces/messageData";

const Image: FC = () => {
	const { message, config } = useMessageContext();
	const payload = getChannelPayload(message, config);
	const { url, altText, buttons } = payload.message.attachment?.payload || {};

	const button: IWebchatButton = buttons?.[0];

	const isDownloadable =
		(buttons as IWebchatButton[])?.find(
			button => "type" in button && button.type === "web_url",
		) !== undefined;

	const [showLightbox, setShowLightbox] = useState(false);

	const contextValue = useMemo(
		() => ({
			onExpand: () => isDownloadable && setShowLightbox(true),
			onClose: () => setShowLightbox(false),
			url,
			altText,
			isDownloadable,
			button,
		}),
		[altText, button, isDownloadable, url],
	);

	if (!url) return null;

	return (
		<ImageMessageContext.Provider value={contextValue}>
			<ImageThumb />
			{showLightbox && <Lightbox />}
		</ImageMessageContext.Provider>
	);
};

export default Image;
