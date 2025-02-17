import { FC, useState } from "react";
import classes from "./Image.module.css";
import classnames from "classnames/bind";
import { useImageMessageContext } from "./hooks";
import { useMessageContext } from "src/messages/hooks";
import { PrimaryButton } from "src/common/Buttons";
import { DownloadIcon } from "src/assets/svg";

const cx = classnames.bind(classes);

const ImageThumb: FC = () => {
	const { config, action, onEmitAnalytics } = useMessageContext();
	const { url, altText, isDownloadable, onExpand, button } = useImageMessageContext();
	const [isImageBroken, setImageBroken] = useState(false);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		event.key === "Enter" && onExpand && onExpand();
	};

	const isDynamicRatio = !!config?.settings?.dynamicImageAspectRatio;

	const imageClasses = cx({
		"webchat-media-template-image": true,
		wrapper: true,
		flexImage: !isDynamicRatio,
		fixedImage: isDynamicRatio,
		wrapperDownloadable: isDownloadable,
	});

	return (
		<div
			className={imageClasses}
			onClick={() => onExpand()}
			onKeyDown={handleKeyDown}
			tabIndex={isDownloadable ? 0 : -1}
			role={isDownloadable ? "button" : undefined}
			aria-label={isDownloadable ? "View Image in fullsize" : undefined}
			data-testid="image-message"
		>
			{isImageBroken ? (
				<span className={classes.brokenImage} />
			) : (
				<img
					src={url}
					alt={altText || "Attachment Image"}
					onError={() => setImageBroken(true)}
				/>
			)}
			{button && (
				<PrimaryButton
					isActionButton
					button={button}
					buttonClassName="webchat-buttons-template-button"
					containerClassName={classes.downloadButtonWrapper}
					customIcon={<DownloadIcon />}
					action={action}
					config={config}
					onEmitAnalytics={onEmitAnalytics}
				/>
			)}
		</div>
	);
};

export default ImageThumb;
