package com.mobileprepaid.boot.model;

import lombok.*;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ott_providers")
public class OTTProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ottId;

    private String ottName;
}
