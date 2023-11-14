import {
	IWebchatButton,
	IWebchatQuickReply,
} from "@cognigy/socket-client/lib/interfaces/messageData";
import { ActionButton } from ".";
import classnames from "classnames";

import classes from "./ActionButtons.module.css";
import { FC, ReactElement } from "react";
import { MessageProps } from "src/Message";

export interface ActionButtonsProps {
	action?: MessageProps["action"];
	payload: IWebchatButton[] | IWebchatQuickReply[];
	containerClassName?: string;
	buttonClassName?: string;
	icon?: ReactElement;
}

const ActionButtons: FC<ActionButtonsProps> = props => {
	const buttons = props.payload.filter((button: ActionButtonsProps["payload"][number]) => {
		if ("type" in button && !["postback", "web_url", "phone_number"].includes(button.type))
			return false;

		if ("content_type" in button && button.content_type === "text" && !button.title)
			return false;

		return true;
	});

	const buttonElements = buttons.map((button, index: number) => (
		<ActionButton
			className={props.buttonClassName}
			key={index}
			button={button}
			action={props.action}
			position={index + 1}
			total={props.payload.length}
			disabled={props.action === undefined}
			icon={props.icon}
		/>
	));

	return (
		<div className={classnames(classes.buttons, props.containerClassName)}>
			{buttonElements}
		</div>
	);
};

export default ActionButtons;
