import moment from "moment";
import l10n from "flatpickr/dist/l10n";
import { key as LocaleKey } from "flatpickr/dist/types/locale";
import { IMessage } from "@cognigy/socket-client";
import customElements from "./flatpickr-plugins/customElements";
import arrowIcon from "src/assets/svg/arrow_back.svg?raw";

export const getOptionsFromMessage = (message: IMessage) => {
    // @ts-expect-error -> need to update IMessage type on socketclient
    const data = message?.data?._plugin?.data;
    if (!data) return {};

    const transformNamedDate = (namedDate: string) => {
        switch (namedDate) {
            case "today":
                return moment().format("YYYY-MM-DD");

            case "tomorrow":
                return moment().add(1, "days").format("YYYY-MM-DD");

            case "yesterday":
                return moment().add(-1, "days").format("YYYY-MM-DD");
        }

        return namedDate;
    };

    const getFlatpickrLocaleId = (locale: string) => {
        switch (locale) {
            case "us":
            case "gb":
            case "au":
            case "ca":
                return "en";
        }

        return locale as LocaleKey;
    };

    const getMomemtLocaleId = (locale: string) => {
        switch (locale) {
            case "au":
                return "en-au";
            case "ca":
                return "en-ca";
            case "gb":
                return "en-gb";
            case "us":
                return "en";
        }

        return locale;
    };

    const isWeekendDate = (date: string) => {
        const isoWeekday = moment(date).isoWeekday();

        switch (isoWeekday) {
            case 6: // saturday
            case 7: // sunday
                return true;
        }

        return false;
    };

    const dateFormat = data.dateFormat || "YYYY-MM-DD";
    const defaultDate =
        transformNamedDate(data.defaultDate) || transformNamedDate(data.minDate) || undefined;

    const localeId = data.locale || "us";
    const momentLocaleId = getMomemtLocaleId(localeId);
    const flatpickrLocaleId = getFlatpickrLocaleId(localeId);
    let locale = l10n[flatpickrLocaleId];
    const enableTime = !!data.enableTime;
    const timeTemp = data.time_24hr ? "H:i" : "h:i"; //12-hour format without AM/PM
    const timeWithSeconds = data.enableSeconds ? `${timeTemp}:S` : timeTemp;
    const timeFormat = data.time_24hr ? timeWithSeconds : `${timeWithSeconds} K`; //12-hour format with AM/PM

    if (localeId === "gb") locale = { ...locale, firstDayOfWeek: 1 };
    const options = {
        nextArrow: arrowIcon,
        prevArrow: arrowIcon,
        defaultHour: data.defaultHour || 12,
        defaultMinute: data.defaultMinute || 0,
        enableSeconds: data.enableSeconds || false,
        hourIncrement: data.hourIncrement || 1,
        minuteIncrement: data.minuteIncrement || 5,
        noCalendar: data.noCalendar || false,
        weekNumbers: data.weekNumbers || false,
        dateFormat: enableTime ? `${dateFormat} ${timeFormat}` : dateFormat,
        defaultDate,
        disable: [],
        enableTime,
        event: data.eventName,
        inline: true,
        locale,
        maxDate: transformNamedDate(data.maxDate) || "",
        minDate: transformNamedDate(data.minDate) || "",
        mode: data.mode || "single",
        static: true,
        time_24hr: data.time_24hr || false,
        parseDate: (dateString: string) => moment(dateString).toDate(),
        // if no custom formatting is defined, apply default formatting
        formatDate: !data.dateFormat
            ? (date: Date) =>
                    moment(date)
                        .locale(momentLocaleId)
                        .format(enableTime ? "L LT" : "L")
            : undefined,
        plugins: [customElements({arrowIcon: arrowIcon})]
    };

    const mask = [...(data.enable_disable || [])]
        // add special rule for weekends
        .map(dateString => {
            if (dateString === "weekends") return isWeekendDate;

            return dateString;
        })
        // resolve relative date names like today, tomorrow or yesterday
        .map(transformNamedDate);

    // the code in function_enable_disable was executed in a vm to check that its return value is from type boolean
    if (data?.function_enable_disable?.length > 0) {
        try {
            const flatpickrFn = new Function(
                `"use strict"; return  ${data.function_enable_disable}`,
            )();
            /* The Flatpickr function takes in a Date object */
            if (typeof flatpickrFn(new Date()) === "boolean") {
                mask.push(flatpickrFn);
            }
        } catch (e) {
            console.log(e);
        }
    }

    if (mask.length > 0 && data.wantDisable) {
        if (data.wantDisable) {
            // add date mask as blacklist
            options.disable = mask as never;
        }
    }

    return options;
};