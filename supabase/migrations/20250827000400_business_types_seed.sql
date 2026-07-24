-- Insert business types with proper progression
-- Each business costs more than the previous one (fits within DECIMAL(10,2) limit of 99,999,999.99)
-- Base pay scales appropriately with cost
INSERT INTO business_types (id, name, icon, base_cost, base_pay, description)
VALUES (
        1,
        'Lemonade Stand',
        '🍋',
        10.00,
        1.00,
        'A simple lemonade stand to get you started'
    ),
    (
        2,
        'Newspaper Route',
        '📰',
        100.00,
        10.00,
        'Daily newspaper delivery service'
    ),
    (
        3,
        'Car Wash',
        '🚗',
        1000.00,
        100.00,
        'Professional car washing service'
    ),
    (
        4,
        'Pizza Delivery',
        '🍕',
        10000.00,
        1000.00,
        'Hot pizza delivery business'
    ),
    (
        5,
        'Donut Shop',
        '🍩',
        100000.00,
        10000.00,
        'Fresh donuts and coffee shop'
    ),
    (
        6,
        'Shrimp Boat',
        '🦐',
        1000000.00,
        100000.00,
        'Commercial shrimp fishing operation'
    ),
    (
        7,
        'Hockey Team',
        '🏒',
        10000000.00,
        1000000.00,
        'Professional hockey franchise'
    ),
    (
        8,
        'Movie Studio',
        '🎬',
        50000000.00,
        5000000.00,
        'Hollywood film production studio'
    ),
    (
        9,
        'Bank',
        '🏦',
        75000000.00,
        7500000.00,
        'Regional banking institution'
    ),
    (
        10,
        'Oil Company',
        '🛢️',
        99999999.99,
        9999999.99,
        'Global energy corporation'
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    base_cost = EXCLUDED.base_cost,
    base_pay = EXCLUDED.base_pay,
    description = EXCLUDED.description;