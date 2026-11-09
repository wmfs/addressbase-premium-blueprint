-- One row per UPRN (the sync joins on uprn + counter), using its preferred LPI.
-- Approved, provisional and alternative LPIs and street records are kept, and historical ones for
-- properties already in the gazetteer, so they arrive with Ordnance Survey's own status (8 = historical).
-- Previously only approved, non-street records got through here, so a refresh removed the rest.
CREATE OR REPLACE VIEW ordnance_survey.addressbase_premium_holding AS
    SELECT DISTINCT ON (property.uprn)
        property.lpi_key,
        property.lpi_status,
        property.uprn,
        1 as counter,
        property.udprn,
        property.state,
        property.state_date,
        property.class,
        property.parent_uprn,
        property.x,
        property.y,
        property.longitude,
        property.latitude,
        property.rpc,
        property.local_custodian_code,
        property.country,
        property.la_start_date,
        property.last_update_date,
        property.entry_date,
        property.rm_organisation_name,
        property.la_organisation,
        property.department_name,
        property.legal_name,
        property.sub_building_name,
        property.building_name,
        property.building_number,
        property.sao_start_number,
        property.sao_start_suffix,
        property.sao_end_number,
        property.sao_end_suffix,
        property.sao_text,
        property.alt_language_sao_text,
        property.pao_start_number,
        property.pao_start_suffix,
        property.pao_end_number,
        property.pao_end_suffix,
        property.pao_text,
        property.alt_language_pao_text,
        property.usrn,
        property.usrn_match_indicator,
        property.area_name,
        property.level,
        property.official_flag,
        property.os_address_toid,
        property.os_address_toid_version,
        property.os_road_link_toid,
        property.os_road_link_toid_version,
        property.os_topo_toid,
        property.os_topo_toid_version,
        property.voa_ct_record,
        property.voa_ndr_record,
        property.dependent_thoroughfare,
        property.thoroughfare,
        property.welsh_dependent_thoroughfare,
        property.welsh_thoroughfare,
        property.double_dependent_locality,
        property.dependent_locality,
        property.welsh_double_dependent_locality,
        property.welsh_dependent_locality,
        property.post_town,
        property.welsh_post_town,
        property.postcode,
        property.postcode_locator,
        property.postcode_type,
        property.delivery_point_suffix,
        property.addressbase_postal,
        property.po_box_number,
        property.ward_code,
        property.parish_code,
        property.rm_start_date,
        property.multi_occ_count,
        property.voa_ndrp_desc_code,
        property.voa_ndr_scat_code,
        property.alt_language,
        street.description AS street_description,
        street.locality,
        street.town_name,
        street.administrative_area,
        concat(property.hash_sum, '-', street.hash_sum) AS hash_sum
    FROM ordnance_survey.addressbase_premium_property_holding property
        JOIN ordnance_survey.addressbase_premium_streets_holding street
        ON (property.usrn = street.usrn)
    -- Historical-only properties are synced only if they're already in the gazetteer:
    -- keep the ones we hold up to date, but don't load OS's whole archive of retired addresses
    WHERE property.lpi_status <> 8
       OR EXISTS (SELECT 1 FROM wmfs.gazetteer g
                  WHERE g.uprn = property.uprn AND g.counter = 1)
    ORDER BY
        property.uprn,
        CASE property.lpi_status WHEN 1 THEN 1 WHEN 6 THEN 2 WHEN 3 THEN 3 WHEN 8 THEN 4 ELSE 5 END,
        property.last_update_date DESC NULLS LAST,
        property.lpi_key;

CREATE OR REPLACE VIEW ordnance_survey.addressbase_premium_streets_holding_view AS
    SELECT
        *,
        1 as counter
    FROM ordnance_survey.addressbase_premium_streets_holding;