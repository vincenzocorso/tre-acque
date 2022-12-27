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

import it.treacque.exceptions.EntityNotFoundException;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.util.List;

@Provider
public class EntityNotFoundHandler implements ExceptionMapper<EntityNotFoundException> {
    @Override
    public Response toResponse(EntityNotFoundException exception) {
        ErrorResponse responseBody = ErrorResponse.builder()
                .type("NOT_FOUND_ERROR")
                .message("The entity with the given id (" + exception.getEntityId() + ") was not found")
                .issues(List.of())
                .build();
        return Response.status(Response.Status.NOT_FOUND).entity(responseBody).build();
    }
}
