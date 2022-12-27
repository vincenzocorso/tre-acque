// Copyright (c) 2022-2023, Tre Acque.
//
// This file is part of Tre Acque.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

package it.treacque.web;

import lombok.Builder;
import lombok.ToString;
import lombok.extern.jackson.Jacksonized;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Builder
@Jacksonized
@ToString
public class FountainRequest {
    @NotEmpty(message = "The name of the fountain must not be empty")
    public final String name;
    @NotNull(message = "The latitude of the fountain must be present")
    public final Double latitude;
    @NotNull(message = "The longitude of the fountain must be present")
    public final Double longitude;
}
