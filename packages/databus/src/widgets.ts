import {
  Converter,
  Convert,
  composeConverter,
  singleConverter,
  staticConverter
} from './converters';
import { Widget } from '@phosphor/widgets';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { View, createViewerMimeType } from './viewers';

const baseMimeType = 'application/x.jupyter.widget; label=';
function widgetMimeType(label: string) {
  return `${baseMimeType}${label}`;
}

export function extractWidgetLabel(mimeType: string): string | null {
  if (!mimeType.startsWith(baseMimeType)) {
    return null;
  }
  return mimeType.slice(baseMimeType.length);
}

export function extractWidgetArgs(
  widget: Widget
): {
  label: string;
  url: string;
} {
  const [label, url] = JSON.parse(widget.id);
  return { label, url };
}

export interface IHasURL {
  url: URL;
}

export function hasURL(t: any): t is IHasURL {
  return 'url' in t;
}

class DataWidget extends MainAreaWidget implements IHasURL {
  constructor(content: Widget, url: URL, label: string) {
    super({ content });
    this.id = JSON.stringify([label, url]);
    this.title.label = `${label}: ${url}`;
    this.title.closable = true;
    this.url = url;
  }
  url: URL;
}
function widgetConvert(label: string): Convert<Widget, Widget> {
  return async (data: Widget, url: URL) => {
    return new DataWidget(data, url, label);
  };
}
export function widgetConverter<T>(
  label: string,
  converter: Converter<T, Widget>
): Converter<T, Widget> {
  return composeConverter(converter, widgetConvert(label));
}

export interface IStaticWidgetConverterOptions<T> {
  mimeType: string;
  label: string;
  convert: Convert<T, Widget>;
}

export function staticWidgetConverter<T>({
  mimeType,
  label,
  convert
}: IStaticWidgetConverterOptions<T>): Converter<T, Widget> {
  return widgetConverter(
    label,
    staticConverter({
      sourceMimeType: mimeType,
      targetMimeType: widgetMimeType(label),
      convert
    })
  );
}

export function widgetViewerConverter(
  display: (widget: Widget) => Promise<void>
): Converter<Widget, View> {
  return singleConverter((mimeType: string) => {
    const label = extractWidgetLabel(mimeType);
    if (label === null) {
      return null;
    }
    return [
      createViewerMimeType(label),
      async data => async () => display(data)
    ];
  });
}