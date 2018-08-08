DELETE FROM wmfs.gazetteer;

INSERT INTO wmfs.gazetteer
(
  uprn,
  origin_hash_sum,
  counter,
  class,
  usrn,
  state,
  local_custodian_code,
  official_flag,
  address_label,
  address_description,
  building_number,
  street_name_1,
  area_name_1,
  postcode,
  post_town,
  data_source
)
VALUES
(
  10024333882,
  '33b58170-ca466a0e',
  1,
  'PP',
  2709319,
  2,
  4605,
  'Y',
  '113 The Vale, Edgbaston, Birmingham, B15 2RU',
  '10024333882',
  '113',
  'THE VALE',
  'EDGBASTON',
  'B15 2RU',
  'BIRMINGHAM',
  'TEST-DATA'
);
