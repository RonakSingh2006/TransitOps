package TransitOps.backend.entity;


import TransitOps.backend.enums.FuelType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fuel_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @Column(name = "liters", nullable = false, precision = 10, scale = 2)
    private BigDecimal liters;

    @Column(name = "cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name="fuel_type", nullable = false)
    private FuelType fuelType;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "odometer_reading", precision = 10, scale = 2)
    private BigDecimal odometerReading;
}

