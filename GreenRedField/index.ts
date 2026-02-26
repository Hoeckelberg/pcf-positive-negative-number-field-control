import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class GreenRedField implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _valueElement: HTMLSpanElement;
    private _context: ComponentFramework.Context<IInputs>;

    /**
     * Used to initialize the control instance. 
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._context = context;
        this._container = container;

        // Add a root class to ensure styles are appropriately scoped
        this._container.classList.add("green-red-field-container");

        // Create the span element that will hold the formatted text
        this._valueElement = document.createElement("span");
        this._valueElement.classList.add("green-red-text");

        this._container.appendChild(this._valueElement);
    }

    /**
     * Called when any value in the property bag has changed.
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;

        // Check if the control is disabled or logically readonly
        // This stops user interaction. Since we are a purely display control, we just reflect it visually.
        const isDisabled = context.mode.isControlDisabled;
        if (isDisabled) {
            this._container.classList.add("disabled");
        } else {
            this._container.classList.remove("disabled");
        }

        // Retrieve the current bound value. It can be null/undefined when creating a new record.
        const rawValue = context.parameters.value.raw;

        // Extract configuration properties with fallbacks
        const threshold = context.parameters.threshold.raw ?? 0;
        const enablePlusSign = context.parameters.enablePlusSign.raw === true;
        const positiveColor = context.parameters.positiveColor.raw || "green";
        const negativeColor = context.parameters.negativeColor.raw || "red";
        const neutralColor = context.parameters.neutralColor.raw || "gray";

        // Inject the chosen colors as CSS Custom Properties on the container
        // This avoids inline-styles directly on elements in favor of CSS logic
        this._container.style.setProperty("--positive-color", positiveColor);
        this._container.style.setProperty("--negative-color", negativeColor);
        this._container.style.setProperty("--neutral-color", neutralColor);

        // Remove previous state classes to reset
        this._valueElement.classList.remove("positive", "negative", "neutral");

        // Handle empty/null values gracefully (Robustness requirement)
        if (rawValue === null || rawValue === undefined || isNaN(rawValue)) {
            this._valueElement.textContent = ""; // Field is empty
            this._valueElement.classList.add("neutral");
            return;
        }

        // We have a valid numerical value. Format it using the context formatting API.
        // The formatted value automatically respects the org's locale or currency constraints 
        // provided by the bound field configuration (e.g. 1.250,00 € in DE)
        let formattedText = context.parameters.value.formatted ? context.parameters.value.formatted : rawValue.toString();

        if (rawValue > threshold) {
            this._valueElement.classList.add("positive");
            if (enablePlusSign && rawValue > 0) {
                // Ensure we don't double the plus if format already included one
                if (!formattedText.startsWith("+") && !formattedText.startsWith("-")) {
                    formattedText = "+" + formattedText;
                }
            }
        } else if (rawValue < threshold) {
            this._valueElement.classList.add("negative");
        } else {
            // value === threshold
            this._valueElement.classList.add("neutral");
        }

        this._valueElement.textContent = formattedText;
    }

    /**
     * Called by the framework prior to a control receiving new data.
     * We return empty outputs since this is a read-only display control.
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is removed from the DOM. Cleanup resources here.
     */
    public destroy(): void {
        // No specific DOM event listeners to detach. 
        // Clearing innerHTML can prevent memory leaks.
        this._container.innerHTML = "";
    }
}
