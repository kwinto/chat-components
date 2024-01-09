import { FC, FunctionComponent } from "react";
import {
	Text,
	Image,
	Video,
	Audio,
	List,
	Gallery,
	TextWithButtons,
	AdaptiveCard,
} from "./messages";
import { IWebchatConfig } from "./messages/types";
import { getChannelPayload } from "./utils";
import { IMessage, IWebchatTemplateAttachment } from "@cognigy/socket-client";

export type MatchConfig = {
	rule: (message: IMessage, config?: IWebchatConfig) => boolean;
	component: FC<any>;
};

const defaultConfig: MatchConfig[] = [
	{
		// Text message
		rule: (message, config) => {
			// do not render engagement messages unless configured!
			if (
				message?.source === "engagement" &&
				!config?.settings?.showEngagementMessagesInChat
			) {
				return false;
			}

			return !!message?.text;
		},
		component: Text,
	},
	{
		// Text with buttons / Quick Replies
		rule: (message, config) => {
			const channelConfig = getChannelPayload(message, config);
			if (!channelConfig) return false;

			const isQuickReplies =
				channelConfig?.message?.quick_replies &&
				channelConfig.message.quick_replies.length > 0;
			const isTextWithButtons =
				(channelConfig?.message?.attachment as IWebchatTemplateAttachment)?.payload
					?.template_type === "button";

			return isQuickReplies || isTextWithButtons;
		},
		component: TextWithButtons,
	},
	{
		// Image
		rule: (message, config) => {
			const channelConfig = getChannelPayload(message, config);
			if (!channelConfig) return false;

			return channelConfig?.message?.attachment?.type === "image";
		},
		component: Image,
	},
	{
		// Video
		rule: (message, config) => {
			const channelConfig = getChannelPayload(message, config);
			if (!channelConfig) return false;

			return channelConfig?.message?.attachment?.type === "video";
		},
		component: Video,
	},
	{
		// Audio
		rule: (message, config) => {
			const channelConfig = getChannelPayload(message, config);
			if (!channelConfig) return false;

			return channelConfig?.message?.attachment?.type === "audio";
		},
		component: Audio,
	},
	{
		// List
		rule: (message, config) => {
			const channelConfig = getChannelPayload(message, config);
			if (!channelConfig) return false;

			return (
				(channelConfig.message?.attachment as IWebchatTemplateAttachment)?.payload
					?.template_type === "list"
			);
		},
		component: List,
	},
	{
		// Gallery
		rule: (message, config) => {
			const channelConfig = getChannelPayload(message, config);
			if (!channelConfig) return false;

			return (
				(channelConfig.message?.attachment as IWebchatTemplateAttachment)?.payload
					?.template_type === "generic"
			);
		},
		component: Gallery,
	},
	{
		rule: (message, config) => {
			const _webchat = message?.data?._cognigy?._webchat?.adaptiveCard;
			const _defaultPreview = message?.data?._cognigy?._defaultPreview?.adaptiveCard;
			const _plugin = message?.data?._plugin?.type === "adaptivecards";
			const defaultPreviewEnabled = config?.settings?.enableDefaultPreview;

			if (message.data?._cognigy?._defaultPreview?.message && defaultPreviewEnabled) {
				return false;
			}

			if (
				(_defaultPreview && defaultPreviewEnabled) ||
				(_webchat && _defaultPreview && !defaultPreviewEnabled) ||
				_webchat ||
				_plugin
			) {
				return true;
			}

			return false;
		},
		component: AdaptiveCard,
	},
];

/**
 * Matches a message to a component by given rule.
 * Accepts `configExtended` to extend with custom rules.
 */
export function match(
	message: IMessage,
	webchatConfig?: IWebchatConfig,
	configExtended: MatchConfig[] = [],
) {
	const config = [...configExtended, ...defaultConfig];

	const match = config.find((matcher: MatchConfig) => matcher.rule(message, webchatConfig));

	if (match && match.component) {
		return match.component;
	}

	return null;
}
