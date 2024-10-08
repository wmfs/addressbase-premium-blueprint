CREATE OR REPLACE VIEW ordnance_survey.addressbase_premium_holding AS
    SELECT
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
    WHERE (property.lpi_status = 1 and (property.pao_text is NULL or property.pao_text != 'STREET RECORD'));

CREATE OR REPLACE VIEW ordnance_survey.addressbase_premium_streets_holding_view AS
    SELECT
        *,
        1 as counter
    FROM ordnance_survey.addressbase_premium_streets_holding;