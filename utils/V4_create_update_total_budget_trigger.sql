-- Create a function to parse budget ranges and calculate total budget
CREATE OR REPLACE FUNCTION calculate_total_budget()
RETURNS TRIGGER AS $$
DECLARE
    partner_data JSONB;
    partner_emails TEXT[];
    partner_email TEXT;
    budget_range_str TEXT;
    parsed_budget_value NUMERIC;
    total_calculated_budget NUMERIC := 0;
    partner_count INT;
BEGIN
    -- Check if 'details' column has changed
    IF NEW.details IS NOT DISTINCT FROM OLD.details THEN
        RETURN NEW;
    END IF;

    -- Extract partner_data
    partner_data := NEW.details->'partner_data';

    -- Check if partner_data exists and is a JSONB object
    IF partner_data IS NULL OR jsonb_typeof(partner_data) != 'object' THEN
        RETURN NEW;
    END IF;

    -- Get the number of partners
    partner_count := jsonb_array_length(jsonb_object_keys(partner_data));

    -- Check if there are exactly two partners
    IF partner_count != 2 THEN
        RETURN NEW;
    END IF;

    -- Iterate through each partner
    FOR partner_email IN SELECT * FROM jsonb_object_keys(partner_data)
    LOOP
        budget_range_str := partner_data->partner_email->>'budget_range';

        -- Check if budget_range exists for the current partner
        IF budget_range_str IS NULL THEN
            RETURN NEW; -- One of the partners is missing budget_range
        END IF;

        -- Attempt to parse the budget range string
        -- This is a simplified parsing. It extracts the first number found.
        BEGIN
            -- Remove non-numeric characters except for '-' and '.'
            budget_range_str := regexp_replace(budget_range_str, '[^0-9.-]+', '', 'g');
            -- Extract the first number (which would be the lower bound or the single value)
            parsed_budget_value := (regexp_match(budget_range_str, '^-?\d+(\.\d+)?'))[1]::NUMERIC;
            total_calculated_budget := total_calculated_budget + parsed_budget_value;
        EXCEPTION WHEN OTHERS THEN
            -- Handle parsing errors, e.g., log a warning or set budget to 0 for this partner
            RAISE WARNING 'Could not parse budget_range: % for partner %', budget_range_str, partner_email;
            -- Optionally, you could return NEW here if parsing failure for one partner means no update
            -- For now, we'll just skip this partner's budget and continue
        END;
    END LOOP;

    -- Update the total_budget column
    NEW.total_budget := total_calculated_budget;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE OR REPLACE TRIGGER update_total_budget_trigger
AFTER UPDATE OF details ON weddings
FOR EACH ROW
WHEN (OLD.details IS DISTINCT FROM NEW.details)
EXECUTE FUNCTION calculate_total_budget();